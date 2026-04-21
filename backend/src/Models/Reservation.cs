using System.ComponentModel.DataAnnotations;

namespace BackofficeAltairis.Models;

public enum ReservationStatus
{
    Pending,
    Confirmed,
    Cancelled,
    CheckedIn,
    CheckedOut
}

public class Reservation
{
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string BookingReference { get; set; } = string.Empty;

    public int? RoomTypeId { get; set; }
    public RoomType? RoomType { get; set; }

    [Required, MaxLength(200)]
    public string GuestName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string GuestEmail { get; set; } = string.Empty;

    [Required]
    public DateOnly CheckIn { get; set; }

    [Required]
    public DateOnly CheckOut { get; set; }

    public int NumberOfGuests { get; set; }

    public decimal TotalPrice { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

    [MaxLength(500)]
    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
