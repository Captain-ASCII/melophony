import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setKeyboardManager } from '@actions/App'
import { selectKeyboardManager } from '@selectors/App'



interface Context {
  [key: string]: string;
}

interface Options {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  withDifferentClickable?: boolean;
  redirectTo?: string;
  containerLevel?: number;
  ref?: React.MutableRefObject<any>;
}

interface RemotelyClickable {
  getId(): number;
}


class Node {
  private id: string
  protected upId: string
  protected downId: string
  protected leftId: string
  protected rightId: string
  private redirectionOnClick: string
  private clickId: string
  private containerLevel: number

  public constructor(id: string, up: string, down: string, left: string, right: string,
    redirectionOnClick: string = null, clickId: string = null, containerLevel: number = 1) {

    this.id = id
    this.upId = up
    this.downId = down
    this.leftId = left
    this.rightId = right
    this.redirectionOnClick = redirectionOnClick
    this.clickId = clickId
    this.containerLevel = containerLevel
  }

  public getId(): string {
    return this.id
  }

  public getClickId(): string {
    if (this.clickId) {
      return this.clickId
    }
    return this.id
  }

  public getContainerLevel(): number {
    return this.containerLevel
  }

  public up(context: Context): string {
    return this.upId
  }

  public down(context: Context): string {
    return this.downId
  }

  public left(context: Context): string {
    return this.leftId
  }

  public right(context: Context): string {
    return this.rightId
  }

  public redirect(context: Context): string {
    return null
  }

  public getRedirectionOnClick(): string {
    return this.redirectionOnClick
  }

  public toString(): string {
    return "[" + this.id + "]"
  }
}


class ContainerNode extends Node {

  private defaultNode: string

  public constructor(id: string, defaultNode: string) {
    super(id, id, id, id, id, id)
    this.defaultNode = defaultNode
  }

  public redirect(context: Context): string {
    return context[this.getId()] || this.defaultNode
  }
}


class ContainedNode extends Node {

  private contextKey: string

  public constructor(id: string, up: string, down: string, left: string, right: string,
    contextKey: string, redirectTo: string, clickId: string = null, containerLevel: number = 1) {
    super(id, up, down, left, right, redirectTo, clickId, containerLevel)
    this.contextKey = contextKey
  }

  public up(context: Context): string {
    context[this.contextKey] = this.getId()
    return super.up(context)
  }

  public down(context: Context): string {
    context[this.contextKey] = this.getId()
    return super.down(context)
  }

  public left(context: Context): string {
    context[this.contextKey] = this.getId()
    return super.left(context)
  }

  public right(context: Context): string {
    context[this.contextKey] = this.getId()
    return super.right(context)
  }
}


export default class KeyboardManager {

  private isEnabled: boolean
  private nodes: Map<string, Node>
  private current: Node
  private context: Context
  private lastMove: number

  public static CLICK_SUFFIX = "_clickable"
  public static LAST_FOCUSED = 'lastFocused'
  public static OFFSET = 150
  public static SMOOTH_DURATION = 150
  public static MOUNT_DELAY = 200

  public constructor() {
    this.nodes = new Map([
      [AppIds.MELOPHONY, new Node(AppIds.MELOPHONY, AppIds.MELOPHONY, AppIds.MENU, AppIds.MELOPHONY, AppIds.MELOPHONY)],
      [AppIds.NO_OPERATION, new Node(AppIds.NO_OPERATION, AppIds.MELOPHONY, AppIds.MAIN_CONTENT, AppIds.MENU, AppIds.MELOPHONY)],
    ])
    this.isEnabled = true
    this.current = this.nodes.get(AppIds.MELOPHONY)
    this.context = { currentNode: null }
    this.lastMove = this.timestamp()
    this.bindKeys()
  }

  private timestamp(): number {
    return new Date().getTime()
  }

  public withNode(id: string, up: string, down: string, left: string, right: string, clickId: string = null): KeyboardManager {
    this.nodes.set(id, new Node(id, up, down, left, right, clickId))
    return this
  }

  public withNodes(containerId: string, nodes: Array<string>, nbColumns: number = 1,
    { top, bottom, left, right, withDifferentClickable, redirectTo, containerLevel }: Options = {}): KeyboardManager {

    for (let i = 0; i < nodes.length; i++) {
      const isFirstRow = i < nbColumns
      const isLastRow = i >= nodes.length - nbColumns
      const isLeftColumn = i % nbColumns === 0
      const isRightColumn = i % nbColumns === nbColumns - 1

      const upNode = isFirstRow ? (top ? top : nodes[i]) : nodes[Math.max(0, i - nbColumns)]
      const downNode = isLastRow ? (bottom ? bottom : nodes[i]) : nodes[Math.min(i + nbColumns, nodes.length)]
      const leftNode = isLeftColumn ? (left ? left : nodes[i]) : nodes[Math.max(0, i - 1)]
      const rightNode = isRightColumn ? (right ? right : nodes[i]) : nodes[Math.min(i + 1, nodes.length)]
      const clickId = withDifferentClickable ? KeyboardManager.getClickIdFromId(nodes[i]) : null

      this.nodes.set(nodes[i], new ContainedNode(
        nodes[i], upNode, downNode, leftNode, rightNode,
        containerId, redirectTo, clickId, containerLevel
      ))
    }
    delete this.context[containerId]
    this.nodes.set(containerId, new ContainerNode(containerId, nodes[0]))
    return this
  }

  private move(moveMethod: (context: Context) => string, context: Context): Node {
    const nextId = moveMethod.apply(this.current, [context])
    if (this.nodes.has(nextId)) {
      return this.tryRedirect(this.nodes.get(nextId), context)
    }
    return this.goTo(AppIds.MELOPHONY)
  }

  private tryRedirect(node: Node, context: Context): Node {
    const redirection = node.redirect(context)
    if (redirection != null) {
      return this.goTo(redirection)
    }
    return node
  }

  private goTo(nodeId: string): Node {
    return this.nodes.get(nodeId)
  }

  public enable(isEnabled: boolean): void {
    this.isEnabled = isEnabled
  }

  public bindKeys() {
    if (! this.isEnabled) {
      return
    }

    document.addEventListener('keydown', event => {
      const currentElement = document.getElementById(this.current.getId())

      if (event.code === 'Enter') {
        document.getElementById(this.current.getClickId()).click()
        this.current = this.tryRedirect(this.current, this.context)
        if (this.current.getRedirectionOnClick()) {
          this.context[KeyboardManager.LAST_FOCUSED] = this.current.getId()
          this.current = this.goTo(this.current.getRedirectionOnClick())
        }
      } else {
        if (currentElement) {
          currentElement.classList.remove('focus')
        }

        if (event.code === Keys.HOME) {
          this.current = this.goTo(AppIds.MELOPHONY)
          document.getElementById(this.current.getId()).click()
        } else if (event.code === Keys.ESCAPE) {
          const closeButton = document.getElementById('closeButton')
          if (closeButton) {
            closeButton.click()
            this.current = this.goTo(this.context[KeyboardManager.LAST_FOCUSED])
            setTimeout(this.scrollAndFocus.bind(this), KeyboardManager.MOUNT_DELAY)
          }
        } else if (event.code === Keys.ARROW_UP) {
          this.current = this.move(this.current.up, this.context)
        } else if (event.code === Keys.ARROW_DOWN) {
          this.current = this.move(this.current.down, this.context)
        } else if (event.code === Keys.ARROW_LEFT) {
          this.current = this.move(this.current.left, this.context)
        } else if (event.code === Keys.ARROW_RIGHT) {
          this.current = this.move(this.current.right, this.context)
        }

        this.scrollAndFocus()
      }
    })
  }

  private scrollAndFocus() {
    const newElement = document.getElementById(this.current.getId())
    if (newElement) {
      let container = newElement
      for (let i = 0; i < this.current.getContainerLevel(); i++) {
        container = container.parentElement
      }

      const moveTime = this.timestamp()
      const behavior = moveTime - this.lastMove > KeyboardManager.SMOOTH_DURATION ? 'smooth' : 'auto'
      this.lastMove = moveTime
      container.scrollTo({top: newElement.offsetTop - KeyboardManager.OFFSET, behavior})
      newElement.classList.add('focus')
    }
  }

  public static addNodes(containerId: string, objects: Array<RemotelyClickable>, options: Options = {}, columnWidth: number = 1000) {
    KeyboardManager.addConstantNodes(containerId, objects.map(o => KeyboardManager.getId(o)), options, columnWidth)
  }

  public static addMainNodes(objects: Array<RemotelyClickable>, options: Options = {}, columnWidth: number = 1000) {
    KeyboardManager.addConstantNodes(AppIds.MAIN_CONTENT, objects.map(o => KeyboardManager.getId(o)), {top: AppIds.MELOPHONY, left: AppIds.MENU, ...options}, columnWidth)
  }

  public static addConstantNodes(containerId: string, nodes: Array<string>, options: Options = {}, columnWidth: number = 1000) {
    const dispatch = useDispatch()
    const keyboardManager = selectKeyboardManager()

    useEffect(() => {
      if (!options.ref || options.ref.current) {
        const nbColumns = options.ref ? Math.max(1, Math.floor(options.ref.current.offsetWidth / columnWidth)) : 1
        dispatch(setKeyboardManager(keyboardManager.withNodes(containerId, nodes, nbColumns, options)))
      }
    }, [])
  }

  public static getId(object: RemotelyClickable): string {
    return `${object.constructor.name}_${object.getId()}`
  }

  public static getClickId(object: RemotelyClickable): string {
    return KeyboardManager.getClickIdFromId(`${object.constructor.name}_${object.getId()}`)
  }

  private static getClickIdFromId(id: string): string {
    return `${id}${KeyboardManager.CLICK_SUFFIX}`
  }
}


class AppIds {
  public static MELOPHONY = 'melophony'
  public static NO_OPERATION = 'no_operation'
  public static MENU = 'menu'
  public static TRACKS_MENU = 'tracks_menu'
  public static PLAYLISTS_MENU = 'playlists_menu'
  public static ARTISTS_MENU = 'artists_menu'
  public static MAIN_CONTENT = 'main_content'
  public static PLAYER = 'player'
}

class Keys {
  public static HOME = 'Home'
  public static ESCAPE = 'Escape'
  public static ARROW_UP = 'ArrowUp'
  public static ARROW_DOWN = 'ArrowDown'
  public static ARROW_LEFT = 'ArrowLeft'
  public static ARROW_RIGHT = 'ArrowRight'
  public static PAGE_UP = 'PageUp'
  public static PAGE_DOWN = 'PageDown'
}


export { AppIds, Keys }