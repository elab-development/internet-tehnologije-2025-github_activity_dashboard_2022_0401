import { dataSource } from "../../database/data-src";
import { Repository } from "../../entities/repository-entity";
import { FollowedRepository } from "../../entities/followed-repository-entity";
import { User } from "../../entities/user-entity";

export class RepositoriesService {
  private repoRepository = dataSource.getRepository(Repository);
  private followedRepoRepository =
    dataSource.getRepository(FollowedRepository);
  private userRepository = dataSource.getRepository(User);

  /**
   * Follow GitHub repository
   */
  async followRepository(userId: number, repoData: any) {
    const [owner, name] = repoData.full_name.split("/");

    let repository = await this.repoRepository.findOne({
      where: { githubId: repoData.id },
    });

    if (!repository) {
      repository = this.repoRepository.create({
        name,
        owner,
        githubId: repoData.id,
      });

      await this.repoRepository.save(repository);
    }

    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
    });

    if (!user) throw new Error("User not found");

    const follow = this.followedRepoRepository.create({
      user,
      repository,
    });

    await this.followedRepoRepository.save(follow);

    return follow;
  }

  /**
   * Get followed repositories
   */
  async getFollowedRepositories(userId: number) {
    return this.followedRepoRepository.find({
      where: { user: { id: Number(userId) } },
      relations: ["repository"],
    });
  }

  /**
   * Unfollow repository
   */
  async unfollow(followId: number) {
    const follow = await this.followedRepoRepository.findOne({
      where: { id: Number(followId) },
    });

    if (!follow) throw new Error("Follow not found");

    await this.followedRepoRepository.remove(follow);

    return { message: "Unfollowed successfully" };
  }
}