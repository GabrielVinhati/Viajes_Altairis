namespace BackofficeAltairis.DTOs;

public record HotelListDto(
    int Id, string Name, string City, string Country,
    int Stars, bool Active, int RoomTypeCount
);

public record HotelDetailDto(
    int Id, string Name, string Address, string City, string Country,
    int Stars, string Phone, string Email, bool Active, DateTime CreatedAt,
    List<RoomTypeDto> RoomTypes
);

public record CreateHotelDto(
    string Name, string Address, string City, string Country,
    int Stars, string Phone, string Email
);

public record UpdateHotelDto(
    string Name, string Address, string City, string Country,
    int Stars, string Phone, string Email, bool Active
);

public record RoomTypeDto(
    int Id, int HotelId, string HotelName, string Name,
    string Description, int Capacity, decimal BasePrice, bool Active
);

public record CreateRoomTypeDto(
    int HotelId, string Name, string Description,
    int Capacity, decimal BasePrice
);

public record AvailabilityDto(
    int Id, int RoomTypeId, string RoomTypeName, string HotelName,
    DateOnly Date, int TotalRooms, int BookedRooms, int AvailableRooms, decimal Price
);

public record CreateAvailabilityDto(
    int RoomTypeId, DateOnly StartDate, DateOnly EndDate,
    int TotalRooms, decimal Price
);

public record ReservationDto(
    int Id, string BookingReference, int? RoomTypeId, string RoomTypeName,
    string HotelName, string GuestName, string GuestEmail,
    DateOnly CheckIn, DateOnly CheckOut, int NumberOfGuests,
    decimal TotalPrice, string Status, string Notes, DateTime CreatedAt
);

public record CreateReservationDto(
    int RoomTypeId, string GuestName, string GuestEmail,
    DateOnly CheckIn, DateOnly CheckOut, int NumberOfGuests, string? Notes
);

public record UpdateReservationStatusDto(string Status);

public record PagedResult<T>(
    List<T> Items, int TotalCount, int Page, int PageSize, int TotalPages
);

public record DashboardDto(
    int TotalHotels, int ActiveHotels, int TotalReservations,
    int TodayCheckIns, int TodayCheckOuts,
    Dictionary<string, int> ReservationsByStatus,
    List<OccupancyDataPoint> OccupancyTrend,
    List<TopHotelDto> TopHotels
);

public record OccupancyDataPoint(DateOnly Date, double OccupancyRate);
public record TopHotelDto(string Name, string City, int ReservationCount);
