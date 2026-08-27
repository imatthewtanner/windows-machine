using CampaignStudio.Web.Contracts;

namespace CampaignStudio.Web.Services;

public static class BriefValidator
{
    private static readonly string[] AllowedChannels = ["Email", "Social", "Display", "Landing page", "Search", "Video", "Print", "Events"];

    public static BriefValidationResult Validate(CampaignBriefRequest request)
    {
        var issues = new List<FieldIssue>();
        Check(request.Brief, nameof(request.Brief), 10, 1000, issues);
        Check(request.TargetAudience, nameof(request.TargetAudience), 3, 600, issues);
        Check(request.ProductDetails, nameof(request.ProductDetails), 10, 1200, issues);
        Check(request.Tone, nameof(request.Tone), 2, 120, issues);

        var channels = request.Channels
            .Select(channel => channel?.Trim() ?? string.Empty)
            .Where(channel => channel.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(8)
            .ToArray();

        if (channels.Length == 0)
            issues.Add(new("channels", "required", "Select at least one desired channel."));

        foreach (var channel in channels.Where(channel => !AllowedChannels.Contains(channel, StringComparer.OrdinalIgnoreCase)))
            issues.Add(new("channels", "unsupported", $"'{channel}' is not a supported channel."));

        var completed = 5 - issues.Select(issue => issue.Field).Distinct(StringComparer.OrdinalIgnoreCase).Count();
        return new(issues.Count == 0, Math.Clamp(completed * 20, 0, 100), issues, channels);
    }

    public static CampaignBriefRequest Normalize(CampaignBriefRequest request, IReadOnlyList<string> channels) => new(
        request.Brief.Trim(),
        request.TargetAudience.Trim(),
        request.ProductDetails.Trim(),
        request.Tone.Trim(),
        channels);

    private static void Check(string? value, string field, int min, int max, ICollection<FieldIssue> issues)
    {
        var normalized = value?.Trim() ?? string.Empty;
        var jsonField = char.ToLowerInvariant(field[0]) + field[1..];
        if (normalized.Length < min)
            issues.Add(new(jsonField, "too_short", $"Enter at least {min} characters."));
        else if (normalized.Length > max)
            issues.Add(new(jsonField, "too_long", $"Keep this field under {max} characters."));
    }
}

