package kr.or.bit.service;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import kr.or.bit.dao.AlramDao;
import kr.or.bit.dao.CalendarDao;
import kr.or.bit.dto.alram;
import kr.or.bit.dto.project_member;

@Service
public class AlramService {
	
	@Autowired
	private SqlSession sqlsession;
	@Autowired
	public void setSqlsession(SqlSession sqlsession) {
		this.sqlsession = sqlsession;
	}
	public void insertAlram(alram alram)throws Exception{
		AlramDao alramdao = sqlsession.getMapper(AlramDao.class);
		System.out.println("알람리스트:"+alram);
		alramdao.insertAlram(alram);
	
	}
	public List<alram> alramList(String email,int project_seq) throws Exception {
	AlramDao alramdao = sqlsession.getMapper(AlramDao.class);
	return alramdao.getAlramList(email,project_seq);
	}
	public int alramLastSeq() {
		AlramDao alramdao = sqlsession.getMapper(AlramDao.class);
		int alramLastSeq = alramdao.getAlramLastSeq();
		return alramLastSeq;
	}
	public void alramDelete(int alramseq) {
		AlramDao alramdao = sqlsession.getMapper(AlramDao.class);
		alramdao.deleteAlram(alramseq);
	}
	public List<String> projectMemberList(int project_seq){
		AlramDao alramdao = sqlsession.getMapper(AlramDao.class);
		return alramdao.projectMemberList(project_seq);
	}
}
