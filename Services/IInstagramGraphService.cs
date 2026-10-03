using AiReelGenerator.Models;

namespace AiReelGenerator.Services
{
    public interface IInstagramGraphService
    {
        Task PublishReelAsync(string videoUrl, string caption);
        Task<InstagramAnalytics> GetAccountAnalyticsAsync();
    }
}