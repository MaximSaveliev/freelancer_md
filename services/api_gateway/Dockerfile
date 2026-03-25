# syntax=docker/dockerfile:1

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution + project files first (better layer caching)
COPY api_gateway.sln ./
COPY api_gateway/api_gateway.csproj api_gateway/
COPY BLL/BLL.csproj BLL/
COPY DAL/DAL.csproj DAL/
COPY PL/PL.csproj PL/

RUN dotnet restore ./api_gateway/api_gateway.csproj

# Copy the rest of the source
COPY . .

# Publish
RUN dotnet publish ./api_gateway/api_gateway.csproj -c Release -o /app/publish /p:UseAppHost=false


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# ASP.NET Core listens on 8080 in containers by convention
ENV ASPNETCORE_URLS=http://+:8088
EXPOSE 8088

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "api_gateway.dll"]

