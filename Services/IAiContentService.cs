using AiReelGenerator.Models;

namespace AiReelGenerator.Services
{
    public interface IAiContentService
    {
        Task<QuoteMetadata> GenerateQuoteMetadataAsync(string niche);
        Task<string> GenerateBackgroundVideoAsync(string veoVisualPrompt);
    }
}