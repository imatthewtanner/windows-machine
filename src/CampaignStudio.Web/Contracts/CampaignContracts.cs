using System.ComponentModel.DataAnnotations;

namespace CampaignStudio.Web.Contracts;

public sealed record CampaignBriefRequest(
    [property: Required, StringLength(1000, MinimumLength = 10)] string Brief,
    [property: Required, StringLength(600, MinimumLength = 3)] string TargetAudience,
    [property: Required, StringLength(1200, MinimumLength = 10)] string ProductDetails,
    [property: Required, StringLength(120, MinimumLength = 2)] string Tone,
    [property: Required, MinLength(1), MaxLength(8)] IReadOnlyList<string> Channels);

public sealed record FieldIssue(string Field, string Code, string Message);

public sealed record BriefValidationResult(
    bool IsValid,
    int Completeness,
    IReadOnlyList<FieldIssue> Issues,
    IReadOnlyList<string> NormalizedChannels);

public sealed record CampaignConcept(string Name, string CentralIdea, string Rationale);
public sealed record CopyVariant(int Number, string Headline, string Body, IReadOnlyList<string> Channels);
public sealed record ChecklistItem(int Order, string Text, string OwnerHint);
public sealed record ImageDirection(string Prompt, string AltText);
public sealed record GeneratedImage(string Id, string Prompt, string? Url, string Size, string Status, string? Error);
public sealed record ChannelReadiness(string Channel, int Score, string Evidence);
public sealed record GenerationMetadata(string Model, string ReasoningEffort, string SchemaVersion, DateTimeOffset CreatedAt, string CorrelationId);

public sealed record CampaignPackage(
    string Id,
    string Status,
    CampaignBriefRequest Brief,
    CampaignConcept Concept,
    IReadOnlyList<CopyVariant> CopyVariants,
    IReadOnlyList<ChecklistItem> LaunchChecklist,
    IReadOnlyList<ImageDirection> ImageDirections,
    IReadOnlyList<GeneratedImage> Images,
    IReadOnlyList<ChannelReadiness> ChannelReadiness,
    GenerationMetadata Metadata);

internal sealed record CampaignTextOutput(
    CampaignConcept Concept,
    IReadOnlyList<CopyVariant> CopyVariants,
    IReadOnlyList<ChecklistItem> LaunchChecklist,
    IReadOnlyList<ImageDirection> ImageDirections);

