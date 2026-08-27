using CampaignStudio.Web.Contracts;

namespace CampaignStudio.Web.Services;

public interface ICampaignStore
{
    Task SaveAsync(CampaignPackage package, CancellationToken cancellationToken);
    Task<CampaignPackage?> GetAsync(string id, CancellationToken cancellationToken);
    Task<string> SaveImageAsync(string campaignId, string imageId, byte[] bytes, CancellationToken cancellationToken);
}

