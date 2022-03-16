import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Conf } from '../core/conf';
import { Color } from "three/src/math/Color";
import { SphereGeometry } from "three/src/geometries/SphereGeometry";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Mesh } from 'three/src/objects/Mesh';
import { Util } from '../libs/util';
import { Mouse } from '../core/mouse';

export class Con extends Canvas {

  private _con: Object3D;
  private _ball:Array<Mesh> = [];
  private _noise:Array<number> = [];
  private _textList:Array<string> = [];
  private _col:Color = new Color(0xffffff)

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D()
    this.mainScene.add(this._con)

    // 表示に使うテキスト入れておく
    this._textList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')

    // ボール
    for(let i = 0; i < 1; i++) {
      const ball = new Mesh(
        new SphereGeometry(0.5, 64, 64),
        new MeshBasicMaterial({
          color:0xff0000,
          transparent:true
        })
      )
      this._con.add(ball)
      this._ball.push(ball)

      this._noise.push(Util.instance.random(0, 1))
    }

    this._resize()
  }


  protected _update(): void {
    super._update()
    this._con.position.y = Func.instance.screenOffsetY() * -1

    const sw = Func.instance.sw()
    const sh = Func.instance.sh()

    const scale = Util.instance.map(Mouse.instance.easeNormal.y, 1, 0.2, 0, 1)
    // let col = new Color(0xffffff)

    const isStart = true
    let text = ''
    const hitArea:Array<number> = [] // 0が空白部分
    const textNum = 140

    // 色 一定間隔で
    if(this._c % 10 == 0) {
      this._col = new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1))
      const bright = 0
      this._col.r += bright
      this._col.g += bright
      this._col.b += bright
    }

    this._ball.forEach((val) => {
      const x = Util.instance.map(val.position.x, 0, 1, -sw * 0.5, sw * 0.5)
      const y = Util.instance.map(val.position.y, 0, 1, -sw * 0.5, sw * 0.5)
      const range = Util.instance.map(y, 0, 0.2, 0, 1)
      for(let i = 0; i < textNum; i++) {
        const per = i / textNum
        if(isStart && Math.abs(per - x) < range) {
          if(hitArea[i] != undefined && hitArea[i] == 0) {
            hitArea[i] = 2
          } else {
            hitArea[i] = 0
          }
        } else {
          if(hitArea[i] == undefined || hitArea[i] != 0) {
            hitArea[i] = 1
          }
        }
      }
    })

    // コンソールに出すテキスト
    // let hitNum = 0
    hitArea.forEach((val,i) => {
      if(val == 1) {
        text += ' '
      } else {
        const key = (this._c + i) % (this._textList.length - 1)
        text += this._textList[key]
      }
    })
    // let tgCol
    // if(hitNum >= 2) {
    //   tgCol = new Color(0xff0000)
    // } else {
    //   tgCol = new Color(0xffffff)
    // }
    // const ease = 0.5
    // this._col.r += (tgCol.r - this._col.r) * ease
    // this._col.g += (tgCol.g - this._col.g) * ease
    // this._col.b += (tgCol.b - this._col.b) * ease
    console.log('%c' + text, 'font-weight:bolder; color:#' + this._col.getHexString() + ';font-size:10px;background-color:#000;')

    // ボールの動き
    let bs = sh * 0.3 * scale * 1
    this._ball.forEach((val,i) => {
      val.scale.set(bs, bs, bs)
      if(i == 0) {
        val.position.x = Mouse.instance.easeNormal.x * sw * 0.5
        val.position.y = Mouse.instance.easeNormal.y * sh * -0.5
      } else {
        let r = Util.instance.radian(this._c * 2 + i * (180 / this._ball.length))
        const n = Util.instance.map(this._noise[i], 0.5, 1.5, 0, 1)
        val.position.x = Math.sin(r * n) * sw * 0.4
        val.position.y = Math.cos(r * -0.8 * n) * sw * 0.4;
      }
      (val.material as MeshBasicMaterial).color = this._col
    })

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    const bgColor = 0x000000
    this.renderer.setClearColor(bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    if(Conf.instance.IS_SP || Conf.instance.IS_TAB) {
      if(w == this.renderSize.width && this.renderSize.height * 2 > h) {
        return
      }
    }

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
