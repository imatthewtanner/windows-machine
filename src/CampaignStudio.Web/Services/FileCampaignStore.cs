using System.Collections.Concurrent;
using System.Text.Json;
using CampaignStudio.Web.Contracts;

namespace CampaignStudio.Web.Services;

public sealed class FileCampaignStore(IWebHostEnvironment environment, ILogger<FileCampaignStore> logger) : ICampaignStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly ConcurrentDictionary<string, CampaignPackage> _cache = new(StringComparer.OrdinalIgnoreCase);
    private readonly string _campaignRoot = Path.Combine(environment.ContentRootPath, "App_Data", "campaigns");
    private readonly string _imageRoot = Path.Combine(environment.ContentRootPath, "App_Data", "images");

    public async Task SaveAsync(CampaignPackage package, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(_campaignRoot);
        var path = CampaignPath(package.Id);
        var temporaryPath = path + ".tmp";
        await File.WriteAllTextAsync(temporaryPath, JsonSerializer.Serialize(package, JsonOptions), cancellationToken);
        File.Move(temporaryPath, path, true);
        _cache[package.Id] = package;
    }

    public async Task<CampaignPackage?> GetAsync(string id, CancellationToken cancellationToken)
    {
        if (!IsSafeId(id)) return null;
        if (_cache.TryGetValue(id, out var cached)) return cached;
        var path = CampaignPath(id);
        if (!File.Exists(path)) return null;
        try
        {
            var json = await File.ReadAllTextAsync(path, cancellationToken);
            var package = JsonSerializer.Deserialize<CampaignPackage>(json, JsonOptions);
            if (package is not null) _cache[id] = package;
            return package;
        }
        catch (JsonException exception)
        {
            logger.LogError(exception, "Stored campaign {CampaignId} could not be parsed.", id);
            return null;
        }
    }

    public async Task<string> SaveImageAsync(string campaignId, string imageId, byte[] bytes, CancellationToken cancellationToken)
    {
        if (!IsSafeId(campaignId) || !IsSafeId(imageId)) throw new ArgumentException("Unsafe generated identifier.");
        var directory = Path.Combine(_imageRoot, campaignId);
        Directory.CreateDirectory(directory);
        var path = Path.Combine(directory, imageId + ".png");
        await File.WriteAllBytesAsync(path, bytes, cancellationToken);
        return $"/generated-images/{campaignId}/{imageId}.png";
    }

    private string CampaignPath(string id) => Path.Combine(_campaignRoot, id + ".json");
    private static bool IsSafeId(string value) => Guid.TryParseExact(value, "N", out _);
}

