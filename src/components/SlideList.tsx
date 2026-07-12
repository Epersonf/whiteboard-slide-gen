import { observer } from 'mobx-react-lite';
import { useProjectStore } from '../store/projectContext';
import { SlideListItem } from './SlideListItem';
import { AddSlideButtons } from './AddSlideButtons';

export const SlideList = observer(function SlideList() {
  const project = useProjectStore();

  return (
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Slides ({project.slides.length})</h2>
      </div>
      <div className="panel__body">
        <ul className="slide-list">
          {project.slides.map((slide, index) => (
            <SlideListItem key={slide.id} slide={slide} index={index} total={project.slides.length} />
          ))}
        </ul>
        <AddSlideButtons />
      </div>
    </section>
  );
});
