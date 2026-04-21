using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackofficeAltairis.Data;
using BackofficeAltairis.DTOs;
using BackofficeAltairis.Models;

namespace BackofficeAltairis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomTypesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RoomTypesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<RoomTypeDto>>> GetAll([FromQuery] int? hotelId)
    {
        var query = _db.RoomTypes.Include(rt => rt.Hotel).AsQueryable();

        if (hotelId.HasValue)
            query = query.Where(rt => rt.HotelId == hotelId.Value);

        var items = await query
            .OrderBy(rt => rt.Hotel.Name).ThenBy(rt => rt.Name)
            .Select(rt => new RoomTypeDto(
                rt.Id, rt.HotelId, rt.Hotel.Name, rt.Name,
                rt.Description, rt.Capacity, rt.BasePrice, rt.Active
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoomTypeDto>> GetById(int id)
    {
        var rt = await _db.RoomTypes.Include(r => r.Hotel).FirstOrDefaultAsync(r => r.Id == id);
        if (rt == null) return NotFound();

        return Ok(new RoomTypeDto(
            rt.Id, rt.HotelId, rt.Hotel.Name, rt.Name,
            rt.Description, rt.Capacity, rt.BasePrice, rt.Active
        ));
    }

    [HttpPost]
    public async Task<ActionResult<RoomTypeDto>> Create(CreateRoomTypeDto dto)
    {
        var hotel = await _db.Hotels.FindAsync(dto.HotelId);
        if (hotel == null) return BadRequest("Hotel not found");

        var roomType = new RoomType
        {
            HotelId = dto.HotelId,
            Name = dto.Name,
            Description = dto.Description,
            Capacity = dto.Capacity,
            BasePrice = dto.BasePrice
        };

        _db.RoomTypes.Add(roomType);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = roomType.Id },
            new RoomTypeDto(roomType.Id, roomType.HotelId, hotel.Name,
                roomType.Name, roomType.Description, roomType.Capacity,
                roomType.BasePrice, roomType.Active));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var rt = await _db.RoomTypes.FindAsync(id);
        if (rt == null) return NotFound();

        // Cancel all active reservations for this room type
        var activeReservations = await _db.Reservations
            .Where(r => r.RoomTypeId == id && r.Status != ReservationStatus.Cancelled)
            .ToListAsync();

        foreach (var reservation in activeReservations)
        {
            reservation.Status = ReservationStatus.Cancelled;
            reservation.Notes = string.IsNullOrEmpty(reservation.Notes)
                ? "Cancelada: habitación eliminada"
                : $"{reservation.Notes} | Cancelada: habitación eliminada";
        }

        // Remove availability records
        var availabilities = await _db.Availabilities
            .Where(a => a.RoomTypeId == id)
            .ToListAsync();
        _db.Availabilities.RemoveRange(availabilities);

        _db.RoomTypes.Remove(rt);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
