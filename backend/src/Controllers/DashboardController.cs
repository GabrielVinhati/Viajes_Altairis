using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackofficeAltairis.Data;
using BackofficeAltairis.DTOs;
using BackofficeAltairis.Models;

namespace BackofficeAltairis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var totalHotels = await _db.Hotels.CountAsync();
        var activeHotels = await _db.Hotels.CountAsync(h => h.Active);
        var totalReservations = await _db.Reservations.CountAsync();
        var todayCheckIns = await _db.Reservations.CountAsync(r => r.CheckIn == today && r.Status != ReservationStatus.Cancelled);
        var todayCheckOuts = await _db.Reservations.CountAsync(r => r.CheckOut == today && r.Status != ReservationStatus.Cancelled);

        var reservationsByStatus = (await _db.Reservations
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync())
            .ToDictionary(x => x.Status.ToString(), x => x.Count);

        var availabilityData = await _db.Availabilities
            .Where(a => a.Date >= today.AddDays(-14) && a.Date <= today.AddDays(14))
            .GroupBy(a => a.Date)
            .Select(g => new {
                Date = g.Key,
                TotalRooms = g.Sum(a => a.TotalRooms),
                BookedRooms = g.Sum(a => a.BookedRooms)
            })
            .OrderBy(x => x.Date)
            .ToListAsync();

        var occupancyTrend = availabilityData.Select(x => new OccupancyDataPoint(
            x.Date,
            x.TotalRooms > 0 ? Math.Round((double)x.BookedRooms / x.TotalRooms * 100, 1) : 0
        )).ToList();

        var topHotels = (await _db.Reservations
            .Include(r => r.RoomType!).ThenInclude(rt => rt.Hotel)
            .Where(r => r.RoomType != null)
            .ToListAsync())
            .GroupBy(r => new { r.RoomType!.Hotel.Name, r.RoomType.Hotel.City })
            .Select(g => new TopHotelDto(g.Key.Name, g.Key.City, g.Count()))
            .OrderByDescending(h => h.ReservationCount)
            .Take(5)
            .ToList();

        return Ok(new DashboardDto(
            totalHotels, activeHotels, totalReservations,
            todayCheckIns, todayCheckOuts,
            reservationsByStatus, occupancyTrend, topHotels
        ));
    }
}
