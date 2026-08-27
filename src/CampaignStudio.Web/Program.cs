using System.Threading.RateLimiting;
using CampaignStudio.Web.Contracts;
using CampaignStudio.Web.Options;
using CampaignStudio.Web.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton<ICampaignStore, FileCampaignStore>();
builder.Services.AddOptions<OpenAiOptions>()
    .Bind(builder.Configuration.GetSection(OpenAiOptions.SectionName))
    .PostConfigure(options =>
    {
        options.ApiKey = builder.Configuration["OPENAI_API_KEY"] ?? options.ApiKey;
        options.TextModel = builder.Configuration["OPENAI_MODEL"] ?? options.TextModel;
    });
builder.Services.AddHttpClient<OpenAiCampaignService>((services, client) =>
{
    var options = services.GetRequiredService<IOptions<OpenAiOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl, UriKind.Absolute);
    client.Timeout = TimeSpan.FromSeconds(Math.Clamp(options.TimeoutSeconds, 15, 300));
});
builder.Services.Configure<FormOptions>(options => options.MultipartBodyLengthLimit = 64 * 1024);
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("generation", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 1,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
        }));
});

var app = builder.Build();

app.UseExceptionHandler(exceptionApp => exceptionApp.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    var problem = exception switch
    {
        CampaignValidationException validation => new ProblemDetails { Status = 400, Title = "Campaign brief validation failed", Detail = "Correct the highlighted fields and try again.", Extensions = { ["validation"] = validation.Result } },
        OpenAiConfigurationException configuration => new ProblemDetails { Status = 503, Title = "Campaign generation is not configured", Detail = configuration.Message },
        OpenAiUpstreamException upstream => new ProblemDetails { Status = upstream.StatusCode is 401 or 403 ? 503 : 502, Title = "Campaign generation service unavailable", Detail = upstream.Message },
        OpenAiPayloadException payload => new ProblemDetails { Status = 502, Title = "Campaign response could not be processed", Detail = payload.Message },
        OperationCanceledException => new ProblemDetails { Status = 499, Title = "Campaign generation was canceled", Detail = "The request ended before generation completed." },
        _ => new ProblemDetails { Status = 500, Title = "Unexpected server error", Detail = "The request could not be completed. Use the correlation identifier when reviewing server logs." }
    };
    problem.Extensions["correlationId"] = context.TraceIdentifier;
    context.Response.StatusCode = problem.Status ?? 500;
    await context.Response.WriteAsJsonAsync(problem);
}));

app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHealthChecks("/health");

var api = app.MapGroup("/api/campaigns");
api.MapPost("/validate", (CampaignBriefRequest request) =>
{
    var result = BriefValidator.Validate(request);
    return result.IsValid ? Results.Ok(result) : Results.BadRequest(result);
});

api.MapPost("", async (CampaignBriefRequest request, OpenAiCampaignService service, HttpContext context, CancellationToken cancellationToken) =>
{
    var package = await service.GenerateAsync(request, context.TraceIdentifier, cancellationToken);
    return Results.Created($"/api/campaigns/{package.Id}", package);
}).RequireRateLimiting("generation").DisableAntiforgery();

api.MapGet("/{id:regex(^[a-fA-F0-9]{{32}}$)}", async (string id, ICampaignStore store, CancellationToken cancellationToken) =>
{
    var package = await store.GetAsync(id, cancellationToken);
    return package is null ? Results.NotFound() : Results.Ok(package);
});

app.MapGet("/generated-images/{campaignId:regex(^[a-fA-F0-9]{{32}}$)}/{fileName:regex(^[a-fA-F0-9]{{32}}\\.png$)}", (string campaignId, string fileName, IWebHostEnvironment environment) =>
{
    var path = Path.Combine(environment.ContentRootPath, "App_Data", "images", campaignId, fileName);
    return File.Exists(path) ? Results.File(path, "image/png", enableRangeProcessing: true) : Results.NotFound();
});

app.MapFallbackToFile("index.html");
app.Run();

public partial class Program;
