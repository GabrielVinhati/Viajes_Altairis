using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackofficeAltairis.Data;
using BackofficeAltairis.DTOs;
using BackofficeAltairis.Models;

namespace BackofficeAltairis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReservationsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<PagedResult<ReservationDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? hotelId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Reservations
            .Include(r => r.RoomType!)
            .ThenInclude(rt => rt.Hotel)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(r =>
                r.BookingReference.ToLower().Contains(search.ToLower()) ||
                r.GuestName.ToLower().Contains(search.ToLower()));
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ReservationStatus>(status, true, out var s))
            query = query.Where(r => r.Status == s);
        if (hotelId.HasValue)
            query = query.Where(r => r.RoomType != null && r.RoomType.HotelId == hotelId.Value);
        if (from.HasValue)
            query = query.Where(r => r.CheckIn >= from.Value);
        if (to.HasValue)
            query = query.Where(r => r.CheckOut <= to.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReservationDto(
                r.Id, r.BookingReference, r.RoomTypeId, r.RoomType != null ? r.RoomType.Name : "(eliminada)",
                r.RoomType != null ? r.RoomType.Hotel.Name : "(eliminado)", r.GuestName, r.GuestEmail,
                r.CheckIn, r.CheckOut, r.NumberOfGuests,
                r.TotalPrice, r.Status.ToString(), r.Notes, r.CreatedAt
            ))
            .ToListAsync();

        return Ok(new PagedResult<ReservationDto>(
            items, totalCount, page, pageSize,
            (int)Math.Ceiling(totalCount / (double)pageSize)
        ));
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(CreateReservationDto dto)
    {
        var roomType = await _db.RoomTypes.Include(rt => rt.Hotel).FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId);
        if (roomType == null) return BadRequest("Room type not found");

        var reference = $"ALT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var nights = dto.CheckOut.DayNumber - dto.CheckIn.DayNumber;
        if (nights <= 0) return BadRequest("CheckOut must be after CheckIn");

        var reservation = new Reservation
        {
            BookingReference = reference,
            RoomTypeId = dto.RoomTypeId,
            GuestName = dto.GuestName,
            GuestEmail = dto.GuestEmail,
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            NumberOfGuests = dto.NumberOfGuests,
            TotalPrice = roomType.BasePrice * nights,
            Status = ReservationStatus.Pending,
            Notes = dto.Notes ?? ""
        };

        // Update availability: increment bookedRooms for each night
        var dates = new List<DateOnly>();
        for (var d = dto.CheckIn; d < dto.CheckOut; d = d.AddDays(1))
            dates.Add(d);

        var availabilities = await _db.Availabilities
            .Where(a => a.RoomTypeId == dto.RoomTypeId && dates.Contains(a.Date))
            .ToListAsync();

        foreach (var date in dates)
        {
            var avail = availabilities.FirstOrDefault(a => a.Date == date);
            if (avail != null)
            {
                avail.BookedRooms = Math.Min(avail.BookedRooms + 1, avail.TotalRooms);
            }
            else
            {
                // Create availability record if it doesn't exist
                _db.Availabilities.Add(new Availability
                {
                    RoomTypeId = dto.RoomTypeId,
                    Date = date,
                    TotalRooms = 10,
                    BookedRooms = 1,
                    Price = roomType.BasePrice
                });
            }
        }

        _db.Reservations.Add(reservation);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), null,
            new ReservationDto(
                reservation.Id, reservation.BookingReference, reservation.RoomTypeId,
                roomType.Name, roomType.Hotel.Name, reservation.GuestName,
                reservation.GuestEmail, reservation.CheckIn, reservation.CheckOut,
                reservation.NumberOfGuests, reservation.TotalPrice,
                reservation.Status.ToString(), reservation.Notes, reservation.CreatedAt
            ));
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, UpdateReservationStatusDto dto)
    {
        var reservation = await _db.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        if (!Enum.TryParse<ReservationStatus>(dto.Status, true, out var status))
            return BadRequest("Invalid status");

        var oldStatus = reservation.Status;
        reservation.Status = status;

        // If cancelling, free up the booked rooms
        if (status == ReservationStatus.Cancelled && oldStatus != ReservationStatus.Cancelled)
        {
            var dates = new List<DateOnly>();
            for (var d = reservation.CheckIn; d < reservation.CheckOut; d = d.AddDays(1))
                dates.Add(d);

            var availabilities = await _db.Availabilities
                .Where(a => a.RoomTypeId == reservation.RoomTypeId && dates.Contains(a.Date))
                .ToListAsync();

            foreach (var avail in availabilities)
            {
                avail.BookedRooms = Math.Max(0, avail.BookedRooms - 1);
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
