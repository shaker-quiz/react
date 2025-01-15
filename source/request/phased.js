import { Extensions, Phases } from '@shakerquiz/utilities'
import { type } from '@yurkimus/types'
import { useCallback, useEffect, useState } from 'react'

/**
 * @template {{ fetch: any }} Contract
 *
 * @param {Contract} contract
 */
export let phased = contract => {
  /** @type {ReturnType<typeof useState<keyof typeof Phases>>} */
  let [phase, setPhase] = useState(Phases.Idle)

  let onbefore = useCallback(
    parameters => {
      setPhase(Phases.Loading)

      return parameters
    },
    [],
  )

  let onfulfilled = useCallback(
    contract => {
      setPhase(Phases.Loading)

      return contract
    },
    [],
  )

  let onrejected = useCallback(
    reason => {
      switch (type(reason)) {
        case 'AbortError':
          setPhase(Phases.Aborted)
          break

        default:
          setPhase(Phases.Failed)
          break
      }

      throw reason
    },
    [],
  )

  useEffect(() => {
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
