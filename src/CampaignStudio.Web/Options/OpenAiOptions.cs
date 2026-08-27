namespace CampaignStudio.Web.Options;

public sealed class OpenAiOptions
{
    public const string SectionName = "OpenAI";

    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.openai.com/v1/";
    public string TextModel { get; set; } = "gpt-5.6";
    public string ReasoningEffort { get; set; } = "medium";
    public string ImageSize { get; set; } = "1536x1024";
    public string ImageQuality { get; set; } = "medium";
    public int ImageCount { get; set; } = 2;
    public int TimeoutSeconds { get; set; } = 120;
}

