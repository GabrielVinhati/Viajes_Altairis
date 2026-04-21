using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackofficeAltairis.Data;
using BackofficeAltairis.DTOs;
using BackofficeAltairis.Models;

namespace BackofficeAltairis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController : ControllerBase
{
    private readonly AppDbContext _db;

    public AvailabilityController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<AvailabilityDto>>> GetAll(
        [FromQuery] int? roomTypeId,
        [FromQuery] int? hotelId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to)
    {
        var query = _db.Availabilities
            .Include(a => a.RoomType)
            .ThenInclude(rt => rt.Hotel)
            .AsQueryable();

        if (roomTypeId.HasValue)
            query = query.Where(a => a.RoomTypeId == roomTypeId.Value);
        if (hotelId.HasValue)
            query = query.Where(a => a.RoomType.HotelId == hotelId.Value);
        if (from.HasValue)
            query = query.Where(a => a.Date >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.Date <= to.Value);

        var items = await query
            .OrderBy(a => a.Date)
            .Select(a => new AvailabilityDto(
                a.Id, a.RoomTypeId, a.RoomType.Name, a.RoomType.Hotel.Name,
                a.Date, a.TotalRooms, a.BookedRooms,
                a.TotalRooms - a.BookedRooms, a.Price
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult> CreateBulk(CreateAvailabilityDto dto)
    {
        var roomType = await _db.RoomTypes.FindAsync(dto.RoomTypeId);
        if (roomType == null) return BadRequest("Room type not found");

        var dates = new List<DateOnly>();
        for (var d = dto.StartDate; d <= dto.EndDate; d = d.AddDays(1))
            dates.Add(d);

        var existing = await _db.Availabilities
            .Where(a => a.RoomTypeId == dto.RoomTypeId && dates.Contains(a.Date))
            .ToListAsync();

        foreach (var date in dates)
        {
            var ex = existing.FirstOrDefault(a => a.Date == date);
            if (ex != null)
            {
                ex.TotalRooms = dto.TotalRooms;
                ex.Price = dto.Price;
            }
            else
            {
                _db.Availabilities.Add(new Availability
                {
                    RoomTypeId = dto.RoomTypeId,
                    Date = date,
                    TotalRooms = dto.TotalRooms,
                    BookedRooms = 0,
                    Price = dto.Price
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { created = dates.Count - existing.Count, updated = existing.Count });
    }
}
