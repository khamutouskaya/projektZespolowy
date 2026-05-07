using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MentalOS.Services
{

    public class ShopService : IShopService
    {
        private readonly AppDbContext _context;

        public ShopService(AppDbContext context)
        {
            _context = context;
        }

        public async Task PurchaseTrasaction(Guid userId, Guid itemId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new Exception("User not found");

            var item = await _context.Set<ShopItem>().FirstOrDefaultAsync(i => i.Id == itemId);
            if (item == null)
                throw new Exception("Item not found");

            var alreadyOwned = await _context.Set<UserItem>()
                .AnyAsync(x => x.UserId == userId && x.ShopItemId == itemId);

            if (alreadyOwned)
                throw new Exception("Item already purchased");

            var newBalance = user.CoinsBalance - item.Price;

            if (newBalance < 0)
                throw new Exception("Not enough coins");

            user.CoinsBalance = newBalance;

            _context.Set<UserItem>().Add(new UserItem
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ShopItemId = itemId,
                PurchasedAt = DateTime.UtcNow
            });

            _context.Set<CoinTransaction>().Add(new CoinTransaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Amount = -item.Price,
                Reason = "purchase",
                Type = "expense",
                BalanceAfter = newBalance,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        public async Task<int> GetBalance(Guid userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            return user.CoinsBalance;
        }

        public async Task<List<ShopItem>> GetAvailableShopItems()
        {
            return await _context.Set<ShopItem>().ToListAsync();
        }

        public async Task<List<UserItem>> GetUserItems(Guid userId)
        {
            return await _context.Set<UserItem>()
                .Where(x => x.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<ShopItem>> PutShopItem(ShopItem item)
        {
            var existingItem = await _context.Set<ShopItem>().FirstOrDefaultAsync(i => i.Id == item.Id);
            if (existingItem != null)
            {
                existingItem.Name = item.Name;
                existingItem.Description = item.Description;
                existingItem.Price = item.Price;
            }
            else
            {
                _context.Set<ShopItem>().Add(item);
            }
            await _context.SaveChangesAsync();
            return await GetAvailableShopItems();
        }

        public async Task EquipItem(Guid userId, Guid itemId)
        {
            var userItems = await _context.UserItems
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var item = userItems.FirstOrDefault(x => x.Id == itemId);

            if (item == null)
                throw new Exception("User doesn't own this item");

            if (item.IsActive)
                return;

            foreach (var userItem in userItems.Where(x => x.IsActive))
            {
                userItem.IsActive = false;
            }

            item.IsActive = true;

            await _context.SaveChangesAsync();
        }

        public async Task UnequipItem(Guid userId, Guid itemId)
        {
            var item = await _context.UserItems
                .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == itemId);

            if (item == null)
                throw new Exception("User doesn't own this item");

            if (!item.IsActive)
                return;

            item.IsActive = false;

            await _context.SaveChangesAsync();
        }
    }
}
