FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

RUN dotnet tool install --global dotnet-ef --version 8.0.11
ENV PATH="$PATH:/root/.dotnet/tools"

COPY src/*.csproj ./
RUN dotnet restore

COPY src/ ./
RUN dotnet ef migrations add InitialCreate --output-dir Data/Migrations
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "BackofficeAltairis.dll"]
