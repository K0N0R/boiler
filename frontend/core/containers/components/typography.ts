import * as PIXI from 'pixi.js';

type TTypographyTextSize = 'normal' | 'huge' | 'big' | 'small' | 'tiny';

type TTypographyHorizontalAlign = 'left' | 'center' | 'right';
type TTypographyVerticalAlign = 'top' | 'center' | 'bottom';

export class Typography extends PIXI.Container {
    private text: PIXI.Text;

    constructor(config: {
        text: string | number;
        kind?: TTypographyTextSize;
        horizontalAlign?: TTypographyHorizontalAlign;
        verticalAlign?: TTypographyVerticalAlign;
        color?: number;
        weight?: 'bold' | 'normal';
        styleProps?: Partial<PIXI.TextStyle> | PIXI.TextStyle;
    }) {
        super();

        this.text = new PIXI.Text({
            text: config.text,
            style: {
                fontFamily: 'Trebuchet MS',
                fontSize: this.getFontSize(config.kind),
                lineHeight: this.getFontSize(config.kind),
                align: config.horizontalAlign ?? 'center',
                fontWeight: config.weight ?? 'normal',
                fill: config.color ?? 0xffffff,
                ...config.styleProps,
            },
        });
        this.text.scale.set(0.5);

        this.text.anchor.set(
            this.getHorizontalAnchor(config.horizontalAlign),
            this.getVerticalAnchor(config.verticalAlign),
        );

        this.addChild(this.text);
    }

    setText(text: string | number) {
        this.text.text = text;
    }

    setColor(color: number) {
        this.text.style.stroke = color;
        this.text.style.fill = color;
    }

    private getFontSize(kind?: TTypographyTextSize) {
        switch (kind) {
            case 'huge':
                return 92;
            case 'big':
                return 72;
            case 'normal':
                return 52;
            case 'small':
                return 32;
            case 'tiny':
                return 20;
            default:
                return 52;
        }
    }

    private getHorizontalAnchor = (horizontalAlign?: TTypographyHorizontalAlign) => {
        switch (horizontalAlign) {
            case 'left':
                return 0;
            case 'center':
                return 0.5;
            case 'right':
                return 1;
            default:
                return 0.5;
        }
    };

    private getVerticalAnchor = (verticalAlign?: TTypographyVerticalAlign) => {
        switch (verticalAlign) {
            case 'top':
                return 0;
            case 'center':
                return 0.5;
            case 'bottom':
                return 1;
            default:
                return 0.5;
        }
    };
}
