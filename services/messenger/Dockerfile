# syntax=docker/dockerfile:1

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution + project files first (better layer caching)
COPY messenger.sln ./
COPY messenger/messenger.csproj messenger/
COPY BLL/BLL.csproj BLL/
COPY DAL/DAL.csproj DAL/

RUN dotnet restore ./messenger/messenger.csproj

# Copy the rest of the source
COPY . .

# Publish
RUN dotnet publish ./messenger/messenger.csproj -c Release -o /app/publish /p:UseAppHost=false


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# ASP.NET Core listens on 8080 in containers by convention
ENV ASPNETCORE_URLS=http://+:8088
EXPOSE 8088

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "messenger.dll"]

