class Victory extends Phaser.Scene {
    constructor() {
        super('victoryScene');
    }

    create() {
        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            "GAME WON\nPress SPACE to restart",
            {
                fontSize: "42px",
                color: "#ffffff",
                align: "center"
            }
        ).setOrigin();

        this.cameras.main.setBackgroundColor('#5f8452');

        this.input.keyboard.once('keydown-SPACE', () => { //if space is held, trigger once
            this.scene.start('pondScene'); // go back to regular scene 
        });
    }
}