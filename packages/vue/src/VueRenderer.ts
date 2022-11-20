/* Copyright 2021, Prosemirror Adapter by Mirone. */
import type { DefineComponent } from 'vue'
import { getCurrentInstance, markRaw, onBeforeMount, onUnmounted, ref } from 'vue'

export type VueRendererComponent = DefineComponent<any, any, any>

export interface VueRenderer<Context> {
  key: string

  context: Context

  render: () => VueRendererComponent

  updateContext: () => void
}

export const useVueRenderer = () => {
  const portals = ref<Record<string, VueRendererComponent>>({})
  const instance = getCurrentInstance()
  const update = markRaw<{ updater?: () => void }>({})

  onBeforeMount(() => {
    update.updater = () => {
      instance?.update()
    }
  })

  onUnmounted(() => {
    update.updater = undefined
  })

  const renderVueRenderer = (renderer: VueRenderer<unknown>) => {
    portals.value[renderer.key] = renderer.render()

    // Force update the vue component to render
    // Cursor won't move to new node without this
    update.updater?.()
  }

  const removeVueRenderer = (renderer: VueRenderer<unknown>) => {
    delete portals.value[renderer.key]
  }

  return {
    portals,
    renderVueRenderer,
    removeVueRenderer,
  } as const
}
