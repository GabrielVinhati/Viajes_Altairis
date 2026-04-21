using System.ComponentModel.DataAnnotations;

namespace BackofficeAltairis.Models;

public class Availability
{
    public int Id { get; set; }

    public int RoomTypeId { get; set; }
    public RoomType RoomType { get; set; } = null!;

    [Required]
    public DateOnly Date { get; set; }

    public int TotalRooms { get; set; }

    public int BookedRooms { get; set; }

    public int AvailableRooms => TotalRooms - BookedRooms;

    public decimal Price { get; set; }
}
