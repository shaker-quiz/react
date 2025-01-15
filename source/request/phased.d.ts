import { Phases } from '@shakerquiz/utilities'
import { useState } from 'react'

export let phased: <Contract extends { fetch: any }>(
  contract: Contract,
) =>
  & Contract
  & {
    phase: ReturnType<typeof useState<keyof typeof Phases>>[0]
    setPhase: ReturnType<typeof useState<keyof typeof Phases>>[1]
  }
