package kr.or.bit.service;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.or.bit.dao.CalendarDao;
import kr.or.bit.dto.calendar;


@Service
public class CalendarService {
	@Autowired
	private SqlSession sqlsession;
	@Autowired
	public void setSqlsession(SqlSession sqlsession) {
		this.sqlsession = sqlsession;
	}

	public void insertCalendar(String start, String end, String title, String content, Boolean allDay, String color,int project_seq,int card_seq)throws Exception{
		CalendarDao calendardao = sqlsession.getMapper(CalendarDao.class);
		calendardao.insertCalendar(start,end,title,content,allDay,color,project_seq,card_seq);
	
	}

	public List<calendar> calendarList(int project_seq) throws Exception {
		CalendarDao calendardao = sqlsession.getMapper(CalendarDao.class);
		return calendardao.getCalendarList(project_seq);
	}
	public List<calendar> calendarListKanban(String email,int project_seq) throws Exception {
		CalendarDao calendardao = sqlsession.getMapper(CalendarDao.class);
		return calendardao.getCalendarListKanban(email,project_seq);
	}
	public void calendarEdit(String start, String end, String id) {
		CalendarDao calendardao = sqlsession.getMapper(CalendarDao.class);
		calendardao.editCalendar(start,end,id);
	}
	public void calendarDelete(int id) throws Exception {
		CalendarDao calendardao = sqlsession.getMapper(CalendarDao.class);
		calendardao.deleteCalendar(id);
	}
	
	public void calendarDeleteKandan(int card_seq) throws Exception {
		CalendarDao calendardao = sqlsession.getMapper(CalendarDao.class);
		calendardao.deleteCalendarKanban(card_seq);
	}
	public void calendarUpdate(String start, String end, String title, String content, boolean allDay, String color, String id) {
		CalendarDao calendardao = sqlsession.getMapper(CalendarDao.class);
		calendardao.updateCalendar(start,end,title,content,allDay,color,id);
	}
}
