import { Player } from '../entities/Player';
import { Spawner } from './Spawner';

export class CollisionSystem {
    private player: Player;
    private spawner: Spawner;

    constructor(player: Player, spawner: Spawner) {
        this.player = player;
        this.spawner = spawner;
    }

    public check(): boolean {
        const playerBox = this.player.getAABB();

        for (const obstacle of this.spawner.obstacles) {
            if (playerBox.intersectsBox(obstacle.getAABB())) {
                return true;
            }
        }
        return false;
    }
}
