import { extensions, Phases } from '@shakerquiz/utilities'
import { type } from '@yurkimus/types'
import { useEffect, useState } from 'react'

/**
 * @template {{ fetch: any }} Contract
 *
 * @param {Contract} contract
 */
export var phased = contract => {
  /** @type {ReturnType<typeof useState<keyof typeof Phases>>} */
  var [phase, setPhase] = useState(Phases.Idle)

  useEffect(() => {
    var onbefore = request => {
      setPhase(Phases.Loading)

      return request
    }

    var onfulfilled = response => {
      setPhase(Phases.Loaded)

      return response
    }

    var onrejected = reason => {
      switch (type(reason)) {
        case 'AbortError':
          setPhase(Phases.Aborted)
          break

        default:
          setPhase(Phases.Failed)
          break
      }

      return reason
    }

    extensions
      .get(contract.fetch)
      .get('onbefore')
      .add(onbefore)

    extensions
      .get(contract.fetch)
      .get('onfulfilled')
      .add(onfulfilled)

    extensions
      .get(contract.fetch)
      .get('onrejected')
      .add(onrejected)

    return () => {
      extensions
        .get(contract.fetch)
        .get('onbefore')
        .delete(onbefore)

      extensions
        .get(contract.fetch)
        .get('onfulfilled')
        .delete(onfulfilled)

      extensions
        .get(contract.fetch)
        .get('onrejected')
        .delete(onrejected)
    }
  }, [])

  return {
    ...contract,
    phase,
    setPhase,
  }
}
