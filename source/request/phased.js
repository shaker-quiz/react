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

  let onbefore = useCallback(() => void setPhase(Phases.Loading), [])

  let onfulfilled = useCallback(contract => {
    setPhase(Phases.Loading)

    return contract
  }, [])

  let onrejected = useCallback(reason => {
    switch (type(reason)) {
      case 'AbortError':
        setPhase(Phases.Aborted)
        break

      default:
        setPhase(Phases.Failed)
        break
    }

    throw reason
  }, [])

  useEffect(() => {
    if (Extensions.has(contract.fetch))
      Extensions.set(contract.fetch, {
        onbefore: Extensions
          .get(contract.fetch)
          .onbefore
          .add(onbefore),

        onfulfilled: Extensions
          .get(contract.fetch)
          .onfulfilled
          .add(onfulfilled),

        onrejected: Extensions
          .get(contract.fetch)
          .onfulfilled
          .add(onrejected),
      })

    return Extensions.set.bind(
      undefined,
      contract.fetch,
      {
        onbefore: Extensions
          .get(contract.fetch)
          .onbefore
          .delete(onbefore),

        onfulfilled: Extensions
          .get(contract.fetch)
          .onfulfilled
          .delete(onfulfilled),

        onrejected: Extensions
          .get(contract.fetch)
          .onfulfilled
          .delete(onrejected),
      },
    )
  }, [])

  return {
    ...contract,
    phase,
    setPhase,
  }
}
