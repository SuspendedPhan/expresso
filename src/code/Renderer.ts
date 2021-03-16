import wu from "wu";
import Root, { RenderShape } from "@/store/Root";
import { DateTime } from "luxon";

export default class Renderer {
  private static get attributeCollection() { return Root.attributeCollection; }
  private static get organismCollection() { return Root.organismCollection; }
  private static get nodeStore() { return Root.nodeStore; }
  private static get time() { return Root.time; }
  private static get windowSize() { return Root.windowSize; }
  private static get metaorganismCollection() { return Root.metaorganismCollection; }
  
  public static *computeRenderCommands(): Iterable<any> {
    const organism = this.organismCollection.getRoot();
    if (organism === null) return;

    this.time.setFrameTime(DateTime.utc());
    const universeDurationMillis = this.time
      .getElapsedUniverseTime()
      .as("milliseconds");
    const time01 =
      universeDurationMillis /
      this.time.getUniverseLifespan().as("milliseconds");

    const timeRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "time",
      false
    );
    const time01Root = this.attributeCollection.getRootNodeFromName(
      organism,
      "time01",
      false
    );
    const windowHeightRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "window.height",
      false
    );
    const windowWidthRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "window.width",
      false
    );
    const windowCenterRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "window.center",
      false
    );

    if (timeRoot) {
      this.nodeStore.putChild(
        timeRoot,
        0,
        this.nodeStore.addNumber(DateTime.utc().toMillis() / 1000)
      );
      // this.nodeStore.putChild(timeRoot, 0, this.nodeStore.addNumber(universeDurationMillis));
    }
    if (windowHeightRoot) {
      this.nodeStore.putChild(
        windowHeightRoot,
        0,
        this.nodeStore.addNumber(this.windowSize.height)
      );
    }
    if (windowWidthRoot) {
      this.nodeStore.putChild(
        windowWidthRoot,
        0,
        this.nodeStore.addNumber(this.windowSize.width)
      );
    }
    if (windowCenterRoot) {
      this.nodeStore.putChild(
        windowCenterRoot,
        0,
        this.nodeStore.addVector(
          this.windowSize.width / 2,
          this.windowSize.height / 2
        )
      );
    }
    if (time01Root) {
      this.nodeStore.putChild(time01Root, 0, this.nodeStore.addNumber(time01));
    }
    yield* this.computeRenderCommandsForOrganism(organism);
  }

  private static *computeRenderCommandsForOrganism(organism): Iterable<any> {
    const clonesRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "clones",
      false
    );
    const clones = clonesRoot?.eval() ?? 1;

    const metaorganism = this.metaorganismCollection.getFromId(
      organism.metaorganismId
    ) as any;

    for (const cloneNumber of wu.count().take(clones)) {
      if (clonesRoot) {
        const cloneNumberRoot = this.attributeCollection.getRootNodeFromName(
          organism,
          "cloneNumber"
        );
        this.nodeStore.putChild(
          cloneNumberRoot,
          0,
          this.nodeStore.addNumber(cloneNumber)
        );

        const cloneNumber01Root = this.attributeCollection.getRootNodeFromName(
          organism,
          "cloneNumber01"
        );
        this.nodeStore.putChild(
          cloneNumber01Root,
          0,
          this.nodeStore.addNumber(cloneNumber / (clones - 1))
        );

        const radialCloneNumber01Root = this.attributeCollection.getRootNodeFromName(
          organism,
          "radialCloneNumber01"
        );
        this.nodeStore.putChild(
          radialCloneNumber01Root,
          0,
          this.nodeStore.addNumber(cloneNumber / clones)
        );
      }

      if (metaorganism.renderShape !== RenderShape.None) {
        const renderCommand = {} as any;
        renderCommand.shape = metaorganism.renderShape;
        for (const attribute of this.attributeCollection.getEditables(
          organism
        )) {
          if (attribute.name === "clones") continue;

          const value = this.attributeCollection.getRootNode(attribute).eval();
          if (attribute.name === "xy") {
            renderCommand.x = value.x;
            renderCommand.y = value.y;
          } else {
            renderCommand[attribute.name] = value;
          }
        }
        yield renderCommand;
      }

      for (const organ of this.organismCollection.getChildren(organism)) {
        yield* this.computeRenderCommandsForOrganism(organ);
      }
    }
  }
}
