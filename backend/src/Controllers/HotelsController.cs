using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackofficeAltairis.Data;
using BackofficeAltairis.DTOs;
using BackofficeAltairis.Models;

namespace BackofficeAltairis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly AppDbContext _db;

    public HotelsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<PagedResult<HotelListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? city,
        [FromQuery] string? country,
        [FromQuery] int? stars,
        [FromQuery] bool? active,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Hotels.AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(h => h.Name.ToLower().Contains(search.ToLower()));
        if (!string.IsNullOrEmpty(city))
            query = query.Where(h => h.City.ToLower().Contains(city.ToLower()));
        if (!string.IsNullOrEmpty(country))
            query = query.Where(h => h.Country.ToLower().Contains(country.ToLower()));
        if (stars.HasValue)
            query = query.Where(h => h.Stars == stars.Value);
        if (active.HasValue)
            query = query.Where(h => h.Active == active.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(h => h.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new HotelListDto(
                h.Id, h.Name, h.City, h.Country,
                h.Stars, h.Active, h.RoomTypes.Count
            ))
            .ToListAsync();

        return Ok(new PagedResult<HotelListDto>(
            items, totalCount, page, pageSize,
            (int)Math.Ceiling(totalCount / (double)pageSize)
        ));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HotelDetailDto>> GetById(int id)
    {
        var hotel = await _db.Hotels
            .Include(h => h.RoomTypes)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hotel == null) return NotFound();

        return Ok(new HotelDetailDto(
            hotel.Id, hotel.Name, hotel.Address, hotel.City, hotel.Country,
            hotel.Stars, hotel.Phone, hotel.Email, hotel.Active, hotel.CreatedAt,
            hotel.RoomTypes.Select(rt => new RoomTypeDto(
                rt.Id, rt.HotelId, hotel.Name, rt.Name,
                rt.Description, rt.Capacity, rt.BasePrice, rt.Active
            )).ToList()
        ));
    }

    [HttpPost]
    public async Task<ActionResult<HotelDetailDto>> Create(CreateHotelDto dto)
    {
        var hotel = new Hotel
        {
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            Stars = dto.Stars,
            Phone = dto.Phone,
            Email = dto.Email
        };

        _db.Hotels.Add(hotel);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = hotel.Id },
            new HotelDetailDto(
                hotel.Id, hotel.Name, hotel.Address, hotel.City, hotel.Country,
                hotel.Stars, hotel.Phone, hotel.Email, hotel.Active, hotel.CreatedAt,
                new List<RoomTypeDto>()
            ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateHotelDto dto)
    {
        var hotel = await _db.Hotels.FindAsync(id);
        if (hotel == null) return NotFound();

        hotel.Name = dto.Name;
        hotel.Address = dto.Address;
        hotel.City = dto.City;
        hotel.Country = dto.Country;
        hotel.Stars = dto.Stars;
        hotel.Phone = dto.Phone;
        hotel.Email = dto.Email;
        hotel.Active = dto.Active;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var hotel = await _db.Hotels
            .Include(h => h.RoomTypes)
            .FirstOrDefaultAsync(h => h.Id == id);
        if (hotel == null) return NotFound();

        var roomTypeIds = hotel.RoomTypes.Select(rt => rt.Id).ToList();

        // Cancel all active reservations for this hotel's room types
        var activeReservations = await _db.Reservations
            .Where(r => r.RoomTypeId.HasValue && roomTypeIds.Contains(r.RoomTypeId.Value) && r.Status != ReservationStatus.Cancelled)
            .ToListAsync();

        foreach (var reservation in activeReservations)
        {
            reservation.Status = ReservationStatus.Cancelled;
            reservation.Notes = string.IsNullOrEmpty(reservation.Notes)
                ? "Cancelada: hotel eliminado"
                : $"{reservation.Notes} | Cancelada: hotel eliminado";
        }

        // Remove availability records
        var availabilities = await _db.Availabilities
            .Where(a => roomTypeIds.Contains(a.RoomTypeId))
            .ToListAsync();
        _db.Availabilities.RemoveRange(availabilities);

        // Remove room types (cascade from hotel won't cancel reservations due to Restrict)
        _db.RoomTypes.RemoveRange(hotel.RoomTypes);
        _db.Hotels.Remove(hotel);

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
