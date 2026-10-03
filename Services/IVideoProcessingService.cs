namespace AiReelGenerator.Services
{
    public interface IVideoProcessingService
    {
        Task<string> OverlayTextOnVideoAsync(string videoPath, string quote, string author);
    }
}