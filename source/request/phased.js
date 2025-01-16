import { Extensions, Phases } from '@shakerquiz/utilities'
import { type } from '@yurkimus/types'
import { useEffect, useState } from 'react'

/**
 * @template {{ fetch: any }} Contract
 *
 * @param {Contract} contract
 */
export let phased = contract => {
  console.log('[phased]')

  /** @type {ReturnType<typeof useState<keyof typeof Phases>>} */
  let [phase, setPhase] = useState(Phases.Idle)

  useEffect(() => {
    let onbefore = parameters => {
      console.log('[onbefore]', parameters)

      setPhase(Phases.Loading)

      return parameters
    }

    let onfulfilled = contract => {
      console.log('onfulfilled', contract)

      setPhase(Phases.Loaded)

      return contract
    }

    let onrejected = reason => {
      console.log('onrejected', reason)

      switch (type(reason)) {
        case 'AbortError':
          setPhase(Phases.Aborted)
          break

        default:
          setPhase(Phases.Failed)
          break
      }
    }

    Extensions
      .get(contract.fetch)
      .get('onbefore')
      .add(onbefore)

    Extensions
      .get(contract.fetch)
      .get('onfulfilled')
      .add(onfulfilled)

    Extensions
      .get(contract.fetch)
      .get('onrejected')
      .add(onrejected)

    return () => {
      Extensions
        .get(contract.fetch)
        .get('onbefore')
        .delete(onbefore)

      Extensions
        .get(contract.fetch)
        .get('onfulfilled')
        .delete(onfulfilled)

      Extensions
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
