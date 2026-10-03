using AiReelGenerator.Services;

namespace AiReelGenerator.HostedServices
{
    public class ReelGeneratorHostedService : BackgroundService
    {
        private readonly ILogger<ReelGeneratorHostedService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public ReelGeneratorHostedService(ILogger<ReelGeneratorHostedService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Reel Generator Hosted Service started.");

            // Wait a bit before starting the first run to allow app to fully start
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Starting daily reel generation pipeline...");

                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var aiContentService = scope.ServiceProvider.GetRequiredService<IAiContentService>();
                        var videoProcessingService = scope.ServiceProvider.GetRequiredService<IVideoProcessingService>();
                        var instagramGraphService = scope.ServiceProvider.GetRequiredService<IInstagramGraphService>();

                        // Define niche for today
                        string niche = "software engineers debugging at 2 AM";

                        // 1. Generate Quote Metadata
                        var metadata = await aiContentService.GenerateQuoteMetadataAsync(niche);
                        _logger.LogInformation("Generated Quote: {Quote}", metadata.Quote);

                        // 2. Generate Background Video
                        var videoPath = await aiContentService.GenerateBackgroundVideoAsync(metadata.VeoVisualPrompt);
                        _logger.LogInformation("Generated Video at: {VideoPath}", videoPath);

                        // 3. Overlay Text on Video
                        var finalVideoUrlPath = await videoProcessingService.OverlayTextOnVideoAsync(videoPath, metadata.Quote, metadata.Author);
                        _logger.LogInformation("Processed Final Video at: {FinalVideoUrlPath}", finalVideoUrlPath);

                        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                        var publicBaseUrl = configuration["PublicBaseUrl"] ?? "https://your-public-domain.com";
                        var fullVideoUrl = $"{publicBaseUrl}{finalVideoUrlPath}";

                        // 4. Publish Reel
                        await instagramGraphService.PublishReelAsync(fullVideoUrl, metadata.InstagramCaption);

                        _logger.LogInformation("Daily reel generation pipeline completed successfully.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during daily reel generation pipeline.");
                }

                // Schedule next run (e.g., in 24 hours)
                // For testing purposes, we use a longer delay. Let's say 24 hours.
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }
    }
}