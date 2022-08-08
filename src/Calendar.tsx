import { Box, Text } from "@chakra-ui/react";
import FullCalendar, { EventApi } from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { Activity, NonClass, Timeslot } from "./activity";
import { Firehose } from "./firehose";
import { toSlot } from "./utils";

import "./Calendar.scss";

/**
 * Calendar showing all the activities, including the buttons on top that
 * change the schedule option selected.
 */
export function Calendar(props: {
  selectedActivities: Array<Activity>;
  viewedActivity: Activity | undefined;
  firehose: Firehose;
}) {
  const { selectedActivities, viewedActivity, firehose } = props;

  const renderEvent = ({
    event,
  }: // timeText,
  {
    event: EventApi;
    timeText: string;
  }) => {
    return (
      <Box p={0.5} lineHeight={1.3}>
        <Text fontSize="sm" fontWeight={500}>
          {event.title}
        </Text>
        <Text fontSize="xs">{event.extendedProps.room}</Text>
      </Box>
    );
  };

  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      allDaySlot={false}
      dayHeaderFormat={{ weekday: "short" }}
      editable={false}
      events={selectedActivities
        .flatMap((act) => act.events)
        .flatMap((event) => event.eventInputs)}
      eventContent={renderEvent}
      eventClick={(e) => {
        // extendedProps: non-standard props of {@link Event.eventInputs}
        firehose.setViewedActivity(e.event.extendedProps.activity);
      }}
      eventDidMount={({ el }) => {
        // change the inset to be further in
        if (!el?.parentElement?.style.inset) return;
        const { inset } = el.parentElement.style;
        el.parentElement.style.inset = inset.replace("50%", "20%");
      }}
      headerToolbar={false}
      height="auto"
      // a date that is, conveniently enough, a monday
      initialDate="2001-01-01"
      slotDuration="00:30:00"
      slotLabelFormat={({ date }) => {
        const { hour } = date;
        return hour === 12
          ? "noon"
          : hour < 12
          ? `${hour} AM`
          : `${hour - 12} PM`;
      }}
      slotMinTime="08:00:00"
      slotMaxTime="22:00:00"
      weekends={false}
      selectable={viewedActivity instanceof NonClass}
      select={(e) => {
        viewedActivity instanceof NonClass &&
          firehose.addTimeslot(
            viewedActivity,
            Timeslot.fromStartEnd(toSlot(e.start), toSlot(e.end))
          );
      }}
    />
  );
}
