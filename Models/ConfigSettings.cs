using System.Text.Json.Serialization;

namespace AiReelGenerator.Models
{
    public class InstagramSettings
    {
        public string MetaAppId { get; set; } = string.Empty;
        public string MetaAppSecret { get; set; } = string.Empty;
        public string InstagramAccountId { get; set; } = string.Empty;
        public string PageAccessToken { get; set; } = string.Empty;
    }

    public class GoogleSettings
    {
        public string ApiKey { get; set; } = string.Empty;
    }

    public class QuoteMetadata
    {
        [JsonPropertyName("Quote")]
        public string Quote { get; set; } = string.Empty;

        [JsonPropertyName("Author")]
        public string Author { get; set; } = string.Empty;

        [JsonPropertyName("InstagramCaption")]
        public string InstagramCaption { get; set; } = string.Empty;

        [JsonPropertyName("VeoVisualPrompt")]
        public string VeoVisualPrompt { get; set; } = string.Empty;
    }

    public class InstagramAnalytics
    {
        public int FollowerCount { get; set; }
        public int Impressions { get; set; }
        public int Reach { get; set; }
        public int ProfileViews { get; set; }
    }
}