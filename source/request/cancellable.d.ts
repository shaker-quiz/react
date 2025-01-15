export let cancellable: <Contract extends { fetch: any }>(
  contract: Contract,
) => any
