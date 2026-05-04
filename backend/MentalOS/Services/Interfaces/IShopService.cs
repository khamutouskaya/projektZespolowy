using MentalOS.Domain;

namespace MentalOS.Services.Interfaces
{
    public interface IShopService
    {
        Task PurchaseTrasaction(Guid userId, Guid shopItemId);
        Task<List<ShopItem>> GetAvailableShopItems();
        Task<List<ShopItem>> PutShopItem(ShopItem item);
        Task<List<UserItem>> GetUserItems(Guid userId);
    }
}
