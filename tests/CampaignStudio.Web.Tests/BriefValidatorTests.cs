using CampaignStudio.Web.Contracts;
using CampaignStudio.Web.Services;
using Xunit;

namespace CampaignStudio.Web.Tests;

public sealed class BriefValidatorTests
{
    [Fact]
    public void CompleteBrief_IsValidAndNormalizesChannels()
    {
        var request = new CampaignBriefRequest(
            "Launch a focused summer hydration awareness campaign.",
            "Active adults ages 18 to 35",
            "Zero sugar powder sticks with essential electrolytes.",
            "Clean and energetic",
            [" Email ", "Email", "Social"]);

        var result = BriefValidator.Validate(request);

        Assert.True(result.IsValid);
        Assert.Equal(100, result.Completeness);
        Assert.Equal(["Email", "Social"], result.NormalizedChannels);
    }

    [Fact]
    public void IncompleteBrief_ReturnsFieldLevelIssues()
    {
        var request = new CampaignBriefRequest("short", "", "missing", "", []);

        var result = BriefValidator.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Issues, issue => issue.Field == "brief");
        Assert.Contains(result.Issues, issue => issue.Field == "channels");
        Assert.InRange(result.Completeness, 0, 99);
    }

    [Fact]
    public void UnsupportedChannel_IsRejected()
    {
        var request = new CampaignBriefRequest(
            "Launch a focused summer hydration awareness campaign.",
            "Active adults",
            "Zero sugar powder sticks with essential electrolytes.",
            "Clean and energetic",
            ["Carrier pigeon"]);

        var result = BriefValidator.Validate(request);

        Assert.Contains(result.Issues, issue => issue.Code == "unsupported");
    }
}
