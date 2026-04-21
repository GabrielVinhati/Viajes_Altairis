using Microsoft.EntityFrameworkCore;
using BackofficeAltairis.Models;

namespace BackofficeAltairis.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<Availability> Availabilities => Set<Availability>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Hotel>(e =>
        {
            e.HasIndex(h => h.Name);
            e.HasIndex(h => h.City);
            e.HasIndex(h => h.Country);
        });

        modelBuilder.Entity<RoomType>(e =>
        {
            e.HasOne(rt => rt.Hotel)
                .WithMany(h => h.RoomTypes)
                .HasForeignKey(rt => rt.HotelId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(rt => rt.BasePrice).HasPrecision(10, 2);
        });

        modelBuilder.Entity<Availability>(e =>
        {
            e.HasOne(a => a.RoomType)
                .WithMany(rt => rt.Availabilities)
                .HasForeignKey(a => a.RoomTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(a => new { a.RoomTypeId, a.Date }).IsUnique();
            e.Property(a => a.Price).HasPrecision(10, 2);
            e.Ignore(a => a.AvailableRooms);
        });

        modelBuilder.Entity<Reservation>(e =>
        {
            e.HasOne(r => r.RoomType)
                .WithMany(rt => rt.Reservations)
                .HasForeignKey(r => r.RoomTypeId)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(r => r.BookingReference).IsUnique();
            e.HasIndex(r => r.Status);
            e.HasIndex(r => r.CheckIn);
            e.Property(r => r.TotalPrice).HasPrecision(10, 2);
        });
    }
}
