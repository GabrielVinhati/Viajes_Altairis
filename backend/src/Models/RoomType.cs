using System.ComponentModel.DataAnnotations;

namespace BackofficeAltairis.Models;

public class RoomType
{
    public int Id { get; set; }

    public int HotelId { get; set; }
    public Hotel Hotel { get; set; } = null!;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public decimal BasePrice { get; set; }

    public bool Active { get; set; } = true;

    public ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
