using AiReelGenerator.Models;
using AiReelGenerator.Services;
using AiReelGenerator.HostedServices;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Bind configuration settings
builder.Services.Configure<GoogleSettings>(builder.Configuration.GetSection("GoogleSettings"));
builder.Services.Configure<InstagramSettings>(builder.Configuration.GetSection("InstagramSettings"));

// Register HttpClient and application services using Typed Clients
builder.Services.AddHttpClient<IAiContentService, AiContentService>();
builder.Services.AddHttpClient<IInstagramGraphService, InstagramGraphService>();
builder.Services.AddScoped<IVideoProcessingService, VideoProcessingService>();

// Register orchestration background service
builder.Services.AddHostedService<ReelGeneratorHostedService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
