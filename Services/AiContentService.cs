using System.Text.Json;
using AiReelGenerator.Models;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.Extensions.Options;

namespace AiReelGenerator.Services
{
    public class AiContentService : IAiContentService
    {
        private readonly GoogleSettings _googleSettings;
        private readonly ILogger<AiContentService> _logger;
        private readonly HttpClient _httpClient;

        public AiContentService(IOptions<GoogleSettings> googleSettings, ILogger<AiContentService> logger, HttpClient httpClient)
        {
            _googleSettings = googleSettings.Value;
            _logger = logger;
            _httpClient = httpClient;
        }

        public async Task<QuoteMetadata> GenerateQuoteMetadataAsync(string niche)
        {
            _logger.LogInformation("Generating quote metadata for niche: {Niche}", niche);

            var client = new Client(apiKey: _googleSettings.ApiKey);

            var prompt = $@"
You are a creative copywriter for Instagram Reels.
Write a highly specific, compelling quote for the following niche: '{niche}'.
For example, if the niche is 'software engineers', the quote should target 'software engineers debugging at 2 AM'.
If the niche is 'independent artists', the quote should target 'independent artists struggling with burnout'.

Generate a strict JSON response containing:
1. 'Quote': The compelling quote text.
2. 'Author': The author of the quote (can be anonymous or a fictional persona relevant to the niche).
3. 'InstagramCaption': A highly engaging caption for the Reel, including 5-10 relevant hashtags.
4. 'VeoVisualPrompt': A hyper-specific, visually arresting prompt for a video generation model. It must be highly descriptive, e.g., 'Macro cinematic shot, volumetric lighting, unreal engine 5 style, 8k resolution, capturing [subject] doing [action]'.

Ensure the response is ONLY a valid JSON object matching this schema. No markdown formatting like ```json.
";

            var config = new GenerateContentConfig
            {
                ResponseMimeType = "application/json"
            };

            var response = await client.Models.GenerateContentAsync(
                model: "gemini-2.5-flash",
                contents: prompt,
                config: config
            );

            var jsonResponse = response.Text;

            if (string.IsNullOrEmpty(jsonResponse))
            {
                throw new Exception("Received empty response from Gemini API.");
            }

            try
            {
                var result = JsonSerializer.Deserialize<QuoteMetadata>(jsonResponse);
                if (result == null)
                    throw new Exception("Deserialized result is null.");

                return result;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse Gemini response as JSON: {Response}", jsonResponse);
                throw new Exception("Failed to parse Gemini response as JSON.", ex);
            }
        }

        public async Task<string> GenerateBackgroundVideoAsync(string veoVisualPrompt)
        {
            _logger.LogInformation("Generating background video for prompt: {Prompt}", veoVisualPrompt);

            var client = new Client(apiKey: _googleSettings.ApiKey);

            // Per instructions: Set aspect ratio for vertical video (9:16)
            var config = new GenerateVideosConfig
            {
                AspectRatio = "9:16"
            };

            var source = new GenerateVideosSource
            {
                Prompt = veoVisualPrompt
            };

            var operation = await client.Models.GenerateVideosAsync(
                model: "veo-3.1-generate-001",
                source: source,
                config: config
            );

            _logger.LogInformation("Starting video generation operation: {OperationId}", operation.Name);

            // Video generation is asynchronous; poll until complete
            while (operation.Done != true)
            {
                _logger.LogInformation("Polling operation {OperationId}...", operation.Name);
                await Task.Delay(15000);
                operation = await client.Operations.GetAsync(operation, null);
            }

            _logger.LogInformation("Video generation completed.");

            if (operation.Error != null)
            {
                throw new Exception($"Video generation failed: {operation.Error}");
            }

            var videoData = operation.Response?.GeneratedVideos?.FirstOrDefault()?.Video?.Uri;
            if (string.IsNullOrEmpty(videoData))
            {
                 throw new Exception("Video URI not found in response.");
            }

            // Download MP4
            var tempDir = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "generated-reels");
            System.IO.Directory.CreateDirectory(tempDir);

            var fileName = $"bg_{Guid.NewGuid()}.mp4";
            var filePath = Path.Combine(tempDir, fileName);

            // Download the video
            var response = await _httpClient.GetAsync(videoData);
            response.EnsureSuccessStatusCode();
            var videoBytes = await response.Content.ReadAsByteArrayAsync();
            await System.IO.File.WriteAllBytesAsync(filePath, videoBytes);

            return filePath;
        }
    }
}