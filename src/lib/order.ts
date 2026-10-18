type Ordered = { data: { order: number } }

export const byOrder = (a: Ordered, b: Ordered) => a.data.order - b.data.order
