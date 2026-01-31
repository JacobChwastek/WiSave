FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution and project files
COPY wisave.slnx .
COPY src/Bootstrappers/WiSave.Bootstrapper/WiSave.Bootstrapper.csproj src/Bootstrappers/WiSave.Bootstrapper/
COPY src/Shared/WiSave.Shared.Abstractions/WiSave.Shared.Abstractions.csproj src/Shared/WiSave.Shared.Abstractions/
COPY src/Shared/WiSave.Shared.Infrastructure/WiSave.Shared.Infrastructure.csproj src/Shared/WiSave.Shared.Infrastructure/

# Restore dependencies
RUN dotnet restore "src/Bootstrappers/WiSave.Bootstrapper/WiSave.Bootstrapper.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR /src/src/Bootstrappers/WiSave.Bootstrapper
RUN dotnet build "WiSave.Bootstrapper.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "WiSave.Bootstrapper.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WiSave.Bootstrapper.dll"]