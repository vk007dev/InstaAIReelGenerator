using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AiReelGenerator.Models;
using AiReelGenerator.Services;

namespace AiReelGenerator.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IInstagramGraphService _instagramGraphService;

    public HomeController(ILogger<HomeController> logger, IInstagramGraphService instagramGraphService)
    {
        _logger = logger;
        _instagramGraphService = instagramGraphService;
    }

    public async Task<IActionResult> Index()
    {
        var analytics = await _instagramGraphService.GetAccountAnalyticsAsync();
        return View(analytics);
    }

    public IActionResult Preview()
    {
        var generatedReelsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "generated-reels");

        string? latestVideo = null;
        if (Directory.Exists(generatedReelsDir))
        {
            var files = Directory.GetFiles(generatedReelsDir, "*.mp4");
            if (files.Length > 0)
            {
                var latestFile = files.OrderByDescending(f => System.IO.File.GetCreationTime(f)).First();
                latestVideo = $"/generated-reels/{Path.GetFileName(latestFile)}";
            }
        }

        ViewBag.LatestVideo = latestVideo;
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Publish(string videoUrl, string caption, [FromServices] IConfiguration configuration)
    {
        if (string.IsNullOrEmpty(videoUrl))
        {
            TempData["Error"] = "No video available to publish.";
            return RedirectToAction("Preview");
        }

        try
        {
            var publicBaseUrl = configuration["PublicBaseUrl"] ?? "https://your-public-domain.com";
            var fullVideoUrl = videoUrl.StartsWith("http") ? videoUrl : $"{publicBaseUrl}{videoUrl}";

            await _instagramGraphService.PublishReelAsync(fullVideoUrl, caption ?? "Check out our latest generated Reel! #AI #Tech");
            TempData["Success"] = "Reel published successfully!";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish reel.");
            TempData["Error"] = $"Failed to publish reel: {ex.Message}";
        }

        return RedirectToAction("Preview");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}