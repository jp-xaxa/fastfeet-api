import { AggregateRoot } from '../entities/aggregate-root.js'
import { UniqueEntityID } from '../entities/unique-entity-id.js'
import { DomainEvent } from './domain-event.js'

type DomainEventCallback = (event: unknown) => void | Promise<void>

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {}
  private static markedAggregates: AggregateRoot<unknown>[] = []

  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id)

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate)
    }
  }

  public static shouldRun = true

  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>,
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

    this.markedAggregates.splice(index, 1)
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityID,
  ): AggregateRoot<unknown> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id))
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID) {
    const aggregate = this.findMarkedAggregateByID(id)

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearEvents()
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  public static register<T extends DomainEvent>(
    callback: (event: T) => void | Promise<void>,
    eventClassName: string,
  ) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = []
    }

    this.handlersMap[eventClassName].push(callback as DomainEventCallback)
  }

  public static clearHandlers() {
    this.handlersMap = {}
  }

  public static clearMarkedAggregates() {
    this.markedAggregates = []
  }

  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name

    const isEventRegistered = eventClassName in this.handlersMap

    if (!this.shouldRun) {
      return
    }

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName]

      for (const handler of handlers) {
        this.runHandler(handler, event, eventClassName)
      }
    }
  }

  // A falha de um handler não pode derrubar o processo, impedir os demais
  // handlers de rodarem nem quebrar a operação que salvou o agregado
  private static runHandler(
    handler: DomainEventCallback,
    event: DomainEvent,
    eventClassName: string,
  ) {
    const onError = (error: unknown) => {
      console.error(`Failed to handle domain event "${eventClassName}"`, error)
    }

    try {
      const result = handler(event)

      if (result instanceof Promise) {
        result.catch(onError)
      }
    } catch (error) {
      onError(error)
    }
  }
}
