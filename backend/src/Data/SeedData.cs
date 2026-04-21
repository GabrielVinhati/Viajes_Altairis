using BackofficeAltairis.Models;

namespace BackofficeAltairis.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        if (context.Hotels.Any()) return;

        var hotels = new List<Hotel>();
        var cities = new[] {
            ("Madrid", "Spain"), ("Barcelona", "Spain"), ("Lisboa", "Portugal"),
            ("Paris", "France"), ("Roma", "Italy"), ("London", "United Kingdom"),
            ("Berlin", "Germany"), ("Amsterdam", "Netherlands"), ("Viena", "Austria"),
            ("Praga", "Czech Republic"), ("Cancún", "Mexico"), ("Buenos Aires", "Argentina"),
            ("São Paulo", "Brazil"), ("Bogotá", "Colombia"), ("Miami", "United States")
        };

        var hotelPrefixes = new[] { "Grand", "Royal", "Premium", "Elite", "Imperial", "Palace", "Boutique", "Central", "Park", "Plaza" };
        var hotelSuffixes = new[] { "Hotel", "Resort", "Suites", "Inn", "Lodge" };
        var roomTypes = new[] { "Standard Single", "Standard Double", "Superior Double", "Junior Suite", "Suite", "Family Room", "Deluxe" };

        var random = new Random(42);
        int hotelCount = 0;

        foreach (var (city, country) in cities)
        {
            int hotelsInCity = random.Next(3, 7);
            for (int i = 0; i < hotelsInCity; i++)
            {
                hotelCount++;
                var hotel = new Hotel
                {
                    Name = $"{hotelPrefixes[random.Next(hotelPrefixes.Length)]} {city} {hotelSuffixes[random.Next(hotelSuffixes.Length)]}",
                    Address = $"Calle Principal {random.Next(1, 500)}, {city}",
                    City = city,
                    Country = country,
                    Stars = random.Next(2, 6),
                    Phone = $"+{random.Next(1, 99)}{random.Next(100000000, 999999999)}",
                    Email = $"info@hotel{hotelCount}.com",
                    Active = random.NextDouble() > 0.1
                };

                int typesCount = random.Next(2, 5);
                var selectedTypes = roomTypes.OrderBy(_ => random.Next()).Take(typesCount).ToList();

                foreach (var typeName in selectedTypes)
                {
                    var basePrice = typeName switch
                    {
                        "Standard Single" => random.Next(50, 100),
                        "Standard Double" => random.Next(80, 150),
                        "Superior Double" => random.Next(120, 200),
                        "Junior Suite" => random.Next(180, 300),
                        "Suite" => random.Next(250, 500),
                        "Family Room" => random.Next(150, 250),
                        "Deluxe" => random.Next(200, 400),
                        _ => random.Next(80, 200)
                    };

                    var roomType = new RoomType
                    {
                        Name = typeName,
                        Description = $"{typeName} room with all amenities",
                        Capacity = typeName.Contains("Single") ? 1 : typeName.Contains("Family") ? 4 : 2,
                        BasePrice = basePrice,
                        Active = true
                    };

                    var today = DateOnly.FromDateTime(DateTime.UtcNow);
                    for (int day = -30; day <= 60; day++)
                    {
                        var date = today.AddDays(day);
                        var totalRooms = random.Next(5, 20);
                        var bookedRooms = random.Next(0, totalRooms + 1);
                        var priceVariation = 1.0m + (decimal)(random.NextDouble() * 0.4 - 0.2);

                        roomType.Availabilities.Add(new Availability
                        {
                            Date = date,
                            TotalRooms = totalRooms,
                            BookedRooms = bookedRooms,
                            Price = Math.Round(basePrice * priceVariation, 2)
                        });
                    }

                    int reservationCount = random.Next(2, 8);
                    for (int r = 0; r < reservationCount; r++)
                    {
                        var checkIn = today.AddDays(random.Next(-15, 30));
                        var nights = random.Next(1, 8);
                        var status = (ReservationStatus)random.Next(0, 5);

                        roomType.Reservations.Add(new Reservation
                        {
                            BookingReference = $"ALT-{hotelCount:D3}-{r:D4}-{random.Next(1000, 9999)}",
                            GuestName = $"Guest {random.Next(1000, 9999)}",
                            GuestEmail = $"guest{random.Next(1000, 9999)}@email.com",
                            CheckIn = checkIn,
                            CheckOut = checkIn.AddDays(nights),
                            NumberOfGuests = random.Next(1, roomType.Capacity + 1),
                            TotalPrice = Math.Round(basePrice * nights * 1.0m, 2),
                            Status = status,
                            Notes = status == ReservationStatus.Cancelled ? "Cancelled by guest" : ""
                        });
                    }

                    hotel.RoomTypes.Add(roomType);
                }

                hotels.Add(hotel);
            }
        }

        context.Hotels.AddRange(hotels);
        await context.SaveChangesAsync();
    }
}
