using System.Text.Json;
using CampaignStudio.Web.Services;

namespace CampaignStudio.Web.Tests;

public sealed class OpenAiResponseParsingTests
{
    [Fact]
    public void ExtractOutputText_ReadsResponsesMessageContent()
    {
        using var document = JsonDocument.Parse("""{"output":[{"type":"message","content":[{"type":"output_text","text":"{\"ok\":true}"}]}]}""");

        var text = OpenAiCampaignService.ExtractOutputText(document.RootElement);

        Assert.Equal("{\"ok\":true}", text);
    }

    [Fact]
    public void ExtractImageResult_ReadsImageGenerationCall()
    {
        using var document = JsonDocument.Parse("""{"output":[{"type":"image_generation_call","result":"aW1hZ2U="}]}""");

        var image = OpenAiCampaignService.ExtractImageResult(document.RootElement);

        Assert.Equal("aW1hZ2U=", image);
    }

    [Fact]
    public void MissingOutput_ReturnsNullWithoutGuessing()
    {
        using var document = JsonDocument.Parse("""{"output":[]}""");

        Assert.Null(OpenAiCampaignService.ExtractOutputText(document.RootElement));
        Assert.Null(OpenAiCampaignService.ExtractImageResult(document.RootElement));
    }
}

