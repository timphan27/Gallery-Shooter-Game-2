class Restart extends Phaser.Scene {
    constructor() {
        super('restartScene');
    }

    create() {
        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            "GAME OVER\nPress SPACE to restart",
            {
                fontSize: "42px",
                color: "#ffffff",
                align: "center"
            }
        ).setOrigin();

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('pondScene'); // go back to game
        });
    }
}