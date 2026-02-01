using HotChocolate.Execution;
using WiSave.Shared.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddModularInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseModularInfrastructure();

app.MapGet("/", () => "WiSave API");
app.MapGraphQL().WithOptions(new HotChocolate.AspNetCore.GraphQLServerOptions
{
    Tool = { Enable = true }
});

app.Run();
