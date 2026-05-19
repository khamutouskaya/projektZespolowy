using MentalOS.DTOs;

namespace MentalOS.Services.Interfaces
{
    public interface IWelcomeRewardService
    {
        /// <summary>
        /// Tries to grant a one-time welcome reward to the user.
        /// Returns null if the reward was already claimed or rewardType is unknown.
        /// </summary>
        Task<WelcomeRewardDto?> TryGrant(Guid userId, string rewardType);
    }
}
